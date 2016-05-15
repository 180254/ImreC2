package p.lodz.pl.adi.enum1;

public enum Status {

    Uploaded("0"),
    Scheduled("1"),
    Processing("2"),
    Done("3");

    private String code;

    Status(String code) {
        this.code = code;
    }

    public String c() {
        return code;
    }
}
