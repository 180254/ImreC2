package p.lodz.pl.adi.config;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class ConfSqs {

    private final String url;
    private final int waitTimeSeconds;

    @JsonCreator
    public ConfSqs(@JsonProperty("Url") String url,
                   @JsonProperty("WaitTimeSeconds") int waitTimeSeconds) {
        this.url = url;
        this.waitTimeSeconds = waitTimeSeconds;
    }

    public String getUrl() {
        return url;
    }

    public int getWaitTimeSeconds() {
        return waitTimeSeconds;
    }
}
