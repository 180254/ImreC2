package p.lodz.pl.adi.exception;

public class ResizingException extends Exception {

    public ResizingException() {
    }

    public ResizingException(String message) {
        super(message);
    }

    public ResizingException(String message, Throwable cause) {
        super(message, cause);
    }

    public ResizingException(Throwable cause) {
        super(cause);
    }
}
