package p.lodz.pl.adi.config;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class Conf {

    private final ConfSdb sdb;
    private final ConfSqs sqs;
    private final ConfS3 s3;

    @JsonCreator
    public Conf(@JsonProperty("Sdb") ConfSdb sdb,
                @JsonProperty("Sqs") ConfSqs sqs,
                @JsonProperty("S3") ConfS3 s3) {

        this.sdb = sdb;
        this.sqs = sqs;
        this.s3 = s3;
    }

    public ConfSdb getSdb() {
        return sdb;
    }

    public ConfSqs getSqs() {
        return sqs;
    }

    public ConfS3 getS3() {
        return s3;
    }
}
