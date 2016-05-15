package p.lodz.pl.adi.config;

import com.amazonaws.auth.AWSCredentialsProvider;
import com.amazonaws.regions.Region;

public interface Config0 {

    AWSCredentialsProvider awsCredentials();

    Region awsRegion();
}
