package p.lodz.pl.adi;

import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.sqs.model.Message;
import com.google.common.util.concurrent.SimpleTimeLimiter;
import org.apache.commons.io.FilenameUtils;
import p.lodz.pl.adi.comm.Commission;
import p.lodz.pl.adi.enum1.Meta;
import p.lodz.pl.adi.utils.AmazonHelper;
import p.lodz.pl.adi.utils.ImageResizer;
import p.lodz.pl.adi.utils.InputStreamE;
import p.lodz.pl.adi.utils.Logger;

import java.io.IOException;
import java.io.InputStream;
import java.util.concurrent.TimeUnit;

public class ResizeTask implements Runnable {

    private Logger logger;
    private AmazonHelper am;
    private ImageResizer ir;

    private Message message;
    private String selfIp;

    private int imageResizeTimeLimitSeconds;
    private Runnable callback;

    public ResizeTask(Message message, Logger logger, AmazonHelper am,
                      ImageResizer ir, String selfIp,
                      int imageResizeTimeLimitSeconds, Runnable callback) {
        this.logger = logger;
        this.am = am;
        this.ir = ir;
        this.message = message;
        this.selfIp = selfIp;
        this.imageResizeTimeLimitSeconds = imageResizeTimeLimitSeconds;
        this.callback = callback;
    }

    @Override
    public void run() {
        logger.log("MESSAGE_PROC_START", message.getMessageId(), message.getBody());

        Commission commission = null;
        ObjectMetadata itemMetadataBackup = null;
        S3Object itemObject = null;

        try {
            commission = Commission.read(message.getBody());

            itemObject = am.s3$getObject(commission.getInputFileKey());
            ObjectMetadata itemMetadata = itemObject.getObjectMetadata();
            itemMetadataBackup = itemMetadata.clone();

            // resize!!
            InputStream object$is = itemObject.getObjectContent();
            int sizeMultiplier = commission.getTask().getScale();
            String imageType = FilenameUtils.getExtension(commission.getFilename());

            logger.log("IMAGE_RESIZE_START", message.getMessageId(), message.getBody());
            InputStreamE resized = new SimpleTimeLimiter()
                    .callWithTimeout(
                            () -> ir.resize(object$is, sizeMultiplier, imageType),
                            imageResizeTimeLimitSeconds, TimeUnit.SECONDS, true);
            logger.log("IMAGE_RESIZE_SUCCESS", message.getMessageId(), message.getBody());

            // update metadata
            itemMetadata.getUserMetadata().put(Meta.WORKER, selfIp);
            itemMetadata.setContentLength(resized.getIsLength());

            // work done
            am.s3$putObject(
                    commission.getOutputFileKey(), resized.getIs(),
                    itemMetadata, CannedAccessControlList.PublicRead);
            am.sqs$deleteMessageAsync(message);

            logger.log("MESSAGE_PROC_SUCCESS", message.getMessageId(), message.getBody());


        } catch (Exception ex) {
            // bad/forbidden task
            logger.log("MESSAGE_PROC_STOP", message.getMessageId(), message.getBody(),
                    ex.getClass().getName(), ex.getMessage());

            if (commission != null && itemMetadataBackup != null) {
                itemMetadataBackup.getUserMetadata().put(Meta.WORKER, selfIp);

                am.s3$copyObject(
                        commission.getInputFileKey(), commission.getOutputFileKeyForFail(),
                        itemMetadataBackup, CannedAccessControlList.PublicRead);
            }

            am.sqs$deleteMessageAsync(message);

        } finally {
            if (itemObject != null) {
                try {
                    itemObject.close();
                } catch (IOException ex) {
                    logger.log2("INT_CLOSE_FAIL", ex.getClass().getName(), ex.getMessage());
                }
            }
        }

        callback.run();
    }
}

