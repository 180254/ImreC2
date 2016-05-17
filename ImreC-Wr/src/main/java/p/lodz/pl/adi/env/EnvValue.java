package p.lodz.pl.adi.env;

public enum EnvValue {
    SleepSeconds("WRSLEEP", 1),
    SleepOnFullSeconds("WRSLEEPFULL", 3),
    ImageSizeLimitPixels("WRSIZELIMIT", Integer.MAX_VALUE),
    ImageResizeTimeLimit("WRTIMELIMIT", 5);

    private String envName;
    private int defaultValue;

    EnvValue(String envName, int defaultValue) {
        this.envName = envName;
        this.defaultValue = defaultValue;
    }

    public String getEnvName() {
        return envName;
    }

    public int getDefaultValue() {
        return defaultValue;
    }
}
