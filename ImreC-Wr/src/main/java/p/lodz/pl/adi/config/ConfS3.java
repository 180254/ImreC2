package p.lodz.pl.adi.config;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class ConfS3 {

    private final String name;
    private final String url;

    @JsonCreator

    public ConfS3(@JsonProperty("Name") String name,
                  @JsonProperty("Url") String url) {

        this.name = name;
        this.url = url;
    }

    public String getName() {
        return name;
    }

    public String getUrl() {
        return url;
    }
}
