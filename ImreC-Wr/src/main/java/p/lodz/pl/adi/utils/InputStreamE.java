package p.lodz.pl.adi.utils;

import java.io.InputStream;

public class InputStreamE {

    private final InputStream is;
    private final long isLength;

    public InputStreamE(InputStream is, long isLength) {
        this.is = is;
        this.isLength = isLength;
    }

    public InputStream getIs() {
        return is;
    }

    public long getIsLength() {
        return isLength;
    }
}
