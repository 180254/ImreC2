package p.lodz.pl.adi;

import com.amazonaws.services.s3.model.AmazonS3Exception;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.sqs.model.Message;
import org.apache.commons.io.FilenameUtils;
import p.lodz.pl.adi.enum1.Meta;
import p.lodz.pl.adi.enum1.Status;
import p.lodz.pl.adi.exception.ResizingException;
import p.lodz.pl.adi.utils.AmazonHelper;
import p.lodz.pl.adi.utils.ImageResizer;
import p.lodz.pl.adi.utils.InputStreamE;
import p.lodz.pl.adi.utils.Logger;

import java.io.InputStream;

public class ResizeTask implements Runnable {

    public static final int VISIBILITY_NEW_TIMEOUT_SEC = 5;

    private Logger logger;
    private AmazonHelper am;
    private ImageResizer ir;

    private Message message;
    private String selfIp;
    private Runnable callback;

    public ResizeTask(Message message, Logger logger, AmazonHelper am,
                      ImageResizer ir, String selfIp, Runnable callback) {
        this.logger = logger;
        this.am = am;
        this.ir = ir;
        this.message = message;
        this.selfIp = selfIp;
        this.callback = callback;
    }

    @Override
    public void run() {
        logger.log("MESSAGE_PROC_START", message.getBody());

        String itemName = message.getBody();
        ObjectMetadata itemMetadataBackup = null;

        try {
            S3Object itemObject = am.s3$getObject(itemName);
            ObjectMetadata itemMetadata = itemObject.getObjectMetadata();
            itemMetadataBackup = itemMetadata.clone();

            // interesting meta
            String meta_newSize = itemMetadata.getUserMetaDataOf(Meta.TASK);
            String meta_oFilename = itemMetadata.getUserMetaDataOf(Meta.FILENAME);
            String meta_workStatus = itemMetadata.getUserMetaDataOf(Meta.STATUS);

            // process only "scheduled", other status = ?!?
            if (!meta_workStatus.equals(Status.Scheduled.c())) {
                logger.log("MESSAGE_PROC_STOP", "REASON=B", message.getBody(), "status=" + meta_workStatus);

                am.s3$deleteObject(itemName);
                am.sqs$deleteMessageAsync(message);

                callback.run();
                return;
            }

            // mark as processing
            copyWithNewStatus(itemName, itemMetadata, Status.Processing);

            // resize!!
            InputStream object$is = itemObject.getObjectContent();
            int sizeMultiplier = Integer.parseInt(meta_newSize);
            String imageType = FilenameUtils.getExtension(meta_oFilename);
            InputStreamE resized = ir.resize(object$is, sizeMultiplier, imageType);

            // update metadata
            itemMetadata.getUserMetadata().put(Meta.STATUS, Status.Done.c());
            itemMetadata.getUserMetadata().put(Meta.WORKER, selfIp);

            itemMetadata.setContentLength(resized.getIsLength());

            // work done
            am.s3$putObject(itemName, resized.getIs(), itemMetadata, CannedAccessControlList.PublicRead);
            am.sqs$deleteMessageAsync(message);

        } catch (ResizingException | IllegalArgumentException | AmazonS3Exception ex) {
            // bad/forbidden task
            logger.log("MESSAGE_PROC_STOP", "REASON=A", message.getBody(), ex.getClass().getName(), ex.getMessage());

            am.s3$deleteObject(itemName);
            am.sqs$deleteMessageAsync(message);

        } catch (RuntimeException ex) {
            logger.log("SOME_EXCEPTION", message.getBody(), ex.getClass().getName(), ex.getMessage());

            // was may be marked as processing
            if (itemMetadataBackup != null) {
                copyWithNewStatus(itemName, itemMetadataBackup, Status.Scheduled);
            }

            am.sqs$changeVisibilityTimeoutAsync(message, VISIBILITY_NEW_TIMEOUT_SEC);
        }

        callback.run();
    }

    private void copyWithNewStatus(String key, ObjectMetadata metadata, Status status) {
        metadata.getUserMetadata().put(Meta.STATUS, status.c());
        am.s3$copyObject(key, key, metadata, CannedAccessControlList.Private);
    }
}

