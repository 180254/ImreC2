package p.lodz.pl.adi.comm;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class Task {

    private final int scale;

    @JsonCreator
    public Task(@JsonProperty("scale") int scale) {
        this.scale = scale;
    }

    public int getScale() {
        return scale;
    }
}
