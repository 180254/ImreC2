package p.lodz.pl.adi.config;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class ConfSdb {

    private final String domain;
    private final String logItemPrefix;

    @JsonCreator
    public ConfSdb(@JsonProperty("Domain") String domain,
                   @JsonProperty("LogItemPrefix") String logItemPrefix) {

        this.domain = domain;
        this.logItemPrefix = logItemPrefix;
    }

    public String getDomain() {
        return domain;
    }

    public String getLogItemPrefix() {
        return logItemPrefix;
    }
}
