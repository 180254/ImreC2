package p.lodz.pl.adi.config;

import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.AWSCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.regions.Region;
import com.amazonaws.regions.Regions;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class Config1 implements Config0 {

    private final String accessKeyId;
    private final String secretAccessKey;
    private final String region;

    @JsonCreator
    public Config1(@JsonProperty("accessKeyId") String accessKeyId,
                   @JsonProperty("secretAccessKey") String secretAccessKey,
                   @JsonProperty("region") String region) {

        this.accessKeyId = accessKeyId;
        this.secretAccessKey = secretAccessKey;
        this.region = region;
    }

    @Override
    public AWSCredentialsProvider awsCredentials() {
        AWSCredentials credentials = new BasicAWSCredentials(accessKeyId, secretAccessKey);

        return new AWSCredentialsProvider() {
            @Override
            public AWSCredentials getCredentials() {
                return credentials;
            }

            @Override
            public void refresh() {
            }
        };
    }

    @Override
    public Region awsRegion() {
        return Region.getRegion(Regions.fromName(region));
    }
}
