package p.lodz.pl.adi.utils;

import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.regions.Region;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.*;
import com.amazonaws.services.simpledb.AmazonSimpleDBAsync;
import com.amazonaws.services.simpledb.AmazonSimpleDBAsyncClient;
import com.amazonaws.services.simpledb.model.PutAttributesRequest;
import com.amazonaws.services.simpledb.model.ReplaceableAttribute;
import com.amazonaws.services.sqs.AmazonSQSAsync;
import com.amazonaws.services.sqs.AmazonSQSAsyncClient;
import com.amazonaws.services.sqs.model.*;
import org.apache.commons.lang3.RandomStringUtils;
import org.apache.commons.lang3.tuple.Pair;
import p.lodz.pl.adi.config.Conf;
import p.lodz.pl.adi.config.Config;

import java.io.InputStream;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

public class AmazonHelper {

    public static final int VISIBILITY_TIMEOUT = 300;
    public static final int LOG_ID_LENGTH = 16;

    private Logger logger;
    private final Conf conf;

    private final AmazonS3 s3;
    private final AmazonSQSAsync sqs;
    private final AmazonSimpleDBAsync sdb;

    public AmazonHelper(Config config, Conf conf) {
        AWSCredentials awsCredentials = config.awsCredentials();
        Region awsRegion = config.awsRegion();

        sqs = new AmazonSQSAsyncClient(awsCredentials);
        sqs.setRegion(awsRegion);

        s3 = new AmazonS3Client(awsCredentials);
        sqs.setRegion(awsRegion);

        sdb = new AmazonSimpleDBAsyncClient(awsCredentials);
        sdb.setRegion(awsRegion);

        this.conf = conf;
    }

    public void setLogger(Logger logger) {
        this.logger = logger;
    }

    private void logger$log(String actions, Object... args) {
        if (logger != null) {
            logger.log(actions, args);
        }
    }

    public S3Object s3$getObject(String key) {
        logger$log("S3_OBJECT_GET", key);

        S3ObjectId objectId = new S3ObjectId(conf.getS3().getName(), key);
        GetObjectRequest itemObjectRequest = new GetObjectRequest(objectId);

        return s3.getObject(itemObjectRequest);
    }

    public void s3$putObject(String key, InputStream is,
                             ObjectMetadata metadata, CannedAccessControlList acl) {
        logger$log("S3_OBJECT_PUT", key, metadata.getUserMetadata().toString());

        PutObjectRequest request2 = new PutObjectRequest(conf.getS3().getName(), key, is, metadata);
        request2.withCannedAcl(acl);

        s3.putObject(request2);
    }

    public void s3$copyObject(String key1, String key2,
                              ObjectMetadata metadata, CannedAccessControlList acl) {
        logger$log("S3_OBJECT_COPY", key1, key2, metadata.getUserMetadata().toString());

        CopyObjectRequest request = new CopyObjectRequest(
                conf.getS3().getName(), key1, conf.getS3().getName(), key2
        );
        request.withNewObjectMetadata(metadata);
        request.withCannedAccessControlList(acl);

        s3.copyObject(request);
    }

    public void s3$deleteObject(String key) {
        logger$log("S3_OBJECT_DELETE", key);

        DeleteObjectRequest request = new DeleteObjectRequest(conf.getS3().getName(), key);

        s3.deleteObject(request);
    }


    public void sdb$putLogAsync(Collection<Pair<String, String>> attrs) {
        List<ReplaceableAttribute> attrs2 =
                attrs.stream()
                        .map(attr -> new ReplaceableAttribute(attr.getKey(), attr.getValue(), true))
                        .collect(Collectors.toList());

        String uuid = RandomStringUtils.randomAlphanumeric(LOG_ID_LENGTH);
        PutAttributesRequest request = new PutAttributesRequest(
                conf.getSdb().getDomain(),
                conf.getSdb().getLogItemPrefix() + uuid,
                attrs2
        );

        sdb.putAttributesAsync(request);
    }

    public List<Message> sqs$receiveMessages(int howMany) {
        ReceiveMessageRequest request = new ReceiveMessageRequest();
        request.setQueueUrl(conf.getSqs().getUrl());
        request.setWaitTimeSeconds(conf.getSqs().getWaitTimeSeconds());
        request.setVisibilityTimeout(VISIBILITY_TIMEOUT);
        request.setMaxNumberOfMessages(howMany);

        ReceiveMessageResult result = sqs.receiveMessage(request);
        return result.getMessages();
    }

    public void sqs$deleteMessageAsync(Message message) {
        logger$log("S3_MESSAGE_DELETE", message.getBody());

        DeleteMessageRequest delRequest = new DeleteMessageRequest();
        delRequest.setQueueUrl(conf.getSqs().getUrl());
        delRequest.setReceiptHandle(message.getReceiptHandle());

        sqs.deleteMessageAsync(delRequest);
    }

    public void sqs$changeVisibilityTimeoutAsync(Message message, int timeoutSeconds) {
        logger$log("S3_CHANGE_VISIBILITY", message.getBody(), timeoutSeconds);

        ChangeMessageVisibilityRequest changeRequest = new ChangeMessageVisibilityRequest();
        changeRequest.setQueueUrl(conf.getSqs().getUrl());
        changeRequest.setReceiptHandle(message.getReceiptHandle());
        changeRequest.setVisibilityTimeout(timeoutSeconds);

        sqs.changeMessageVisibilityAsync(changeRequest);
    }
}
