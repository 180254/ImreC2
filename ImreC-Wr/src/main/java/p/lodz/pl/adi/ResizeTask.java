package p.lodz.pl.adi;

import com.amazonaws.services.s3.model.AmazonS3Exception;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.sqs.model.Message;
import org.apache.commons.io.FilenameUtils;
import p.lodz.pl.adi.comm.Commission;
import p.lodz.pl.adi.enum1.Meta;
import p.lodz.pl.adi.exception.ResizingException;
import p.lodz.pl.adi.utils.AmazonHelper;
import p.lodz.pl.adi.utils.ImageResizer;
import p.lodz.pl.adi.utils.InputStreamE;
import p.lodz.pl.adi.utils.Logger;

import java.io.IOException;
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

        Commission commission = null;
        ObjectMetadata itemMetadataBackup = null;

        try {
            commission = Commission.read(message.getBody());

            S3Object itemObject = am.s3$getObject(commission.getInputFileKey());
            ObjectMetadata itemMetadata = itemObject.getObjectMetadata();
            itemMetadataBackup = itemMetadata.clone();

            // interesting meta
            String meta_oFilename = itemMetadata.getUserMetaDataOf(Meta.FILENAME);

            // resize!!
            InputStream object$is = itemObject.getObjectContent();
            int sizeMultiplier = commission.getTask().getScale();
            String imageType = FilenameUtils.getExtension(meta_oFilename);
            InputStreamE resized = ir.resize(object$is, sizeMultiplier, imageType);

            // update metadata
            itemMetadata.getUserMetadata().put(Meta.WORKER, selfIp);
            itemMetadata.setContentLength(resized.getIsLength());

            // work done
            am.s3$putObject(
                    commission.getOutputFileKey(), resized.getIs(),
                    itemMetadata, CannedAccessControlList.PublicRead);
            am.sqs$deleteMessageAsync(message);

        } catch (IOException | ResizingException | IllegalArgumentException | AmazonS3Exception ex) {
            // bad/forbidden task
            logger.log("MESSAGE_PROC_STOP", message.getBody(), ex.getClass().getName(), ex.getMessage());

            if (commission != null && itemMetadataBackup != null) {
                itemMetadataBackup.getUserMetadata().put(Meta.WORKER, selfIp);

                am.s3$copyObject(
                        commission.getInputFileKey(), commission.getOutputFileKey(),
                        itemMetadataBackup, CannedAccessControlList.Private);
            }

            am.sqs$deleteMessageAsync(message);

        } catch (RuntimeException ex) {
            logger.log("MESSAGE_PROC_EXCEPTION", message.getBody(), ex.getClass().getName(), ex.getMessage());

            am.sqs$changeVisibilityTimeoutAsync(message, VISIBILITY_NEW_TIMEOUT_SEC);
        }

        callback.run();
    }
}

