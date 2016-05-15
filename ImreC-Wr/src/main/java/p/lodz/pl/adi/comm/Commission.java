package p.lodz.pl.adi.comm;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;

public class Commission {

    private final String storageId1;
    private final String storageId2;
    private final String filename;
    private final Task task;

    @JsonCreator
    public Commission(@JsonProperty("storageId1") String storageId1,
                      @JsonProperty("storageId2") String storageId2,
                      @JsonProperty("filename") String filename,
                      @JsonProperty("task") Task task) {

        this.storageId1 = storageId1;
        this.storageId2 = storageId2;
        this.filename = filename;
        this.task = task;
    }

    public Task getTask() {
        return task;
    }

    public String getStorageId1() {
        return storageId1;
    }

    public String getStorageId2() {
        return storageId2;
    }

    public String getFilename() {
        return filename;
    }

    public String getInputFileKey() {
        return String.format("%s/%s", storageId1, filename);
    }

    public String getOutputFileKey() {
        return String.format("%s/%s", storageId2, filename);
    }

    public String getOutputFileKeyForFail() {
        return String.format("%s/FAIL_%s", storageId2, filename);
    }

    public static Commission read(String str) throws IOException {
        return new ObjectMapper().reader(Commission.class).readValue(str);
    }
}
