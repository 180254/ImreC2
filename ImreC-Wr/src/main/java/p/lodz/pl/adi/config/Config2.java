package p.lodz.pl.adi.config;


import com.amazonaws.auth.AWSCredentialsProvider;
import com.amazonaws.regions.Region;

public class Config2 implements Config0 {

    private final AWSCredentialsProvider awsCredentialsProvider;

    public Config2(AWSCredentialsProvider awsCredentialsProvider) {
        this.awsCredentialsProvider = awsCredentialsProvider;
    }

    @Override
    public AWSCredentialsProvider awsCredentials() {
        return awsCredentialsProvider;
    }

    @Override
    public Region awsRegion() {
        return null;
    }
}
