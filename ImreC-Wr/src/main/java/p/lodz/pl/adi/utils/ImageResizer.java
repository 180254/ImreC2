package p.lodz.pl.adi.utils;

import org.imgscalr.Scalr;
import p.lodz.pl.adi.exception.ResizingException;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.awt.image.RenderedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.stream.Stream;

public class ImageResizer {

    private final String[] PROPER_IMG_TYPES = {
            "PNG", "GIF", "BMP", "JPG", "JPEG",
    };

    /**
     * @throws ResizingException if resizing failed due to IO
     * @throws IllegalArgumentException if resizing failed due to arguments
     */
    public InputStreamE resize(InputStream is, int sizeMultiplier, String imageType) throws ResizingException {
        try {
            ensureImageType(imageType);
            ensureSizeMultiplier(sizeMultiplier);

            BufferedImage srcImage = ImageIO.read(is);
            if (srcImage == null) {
                throw new ResizingException("srcImage == null");
            }

            double sizeMultiplier2 = sizeMultiplier / 100.0;
            int newWidth = (int) (srcImage.getWidth() * sizeMultiplier2);
            int newHeight = (int) (srcImage.getHeight() * sizeMultiplier2);

            BufferedImage scaledImage = Scalr.resize(srcImage, newWidth, newHeight);

            return makeResult(scaledImage, imageType);

        } catch (IOException e) {
            throw new ResizingException(e);
        }
    }

    private InputStreamE makeResult(RenderedImage image, String imageType) throws IOException {
        ByteArrayOutputStream os = new ByteArrayOutputStream();
        ImageIO.write(image, imageType, os);

        byte[] bytes = os.toByteArray();
        InputStream is = new ByteArrayInputStream(bytes);
        return new InputStreamE(is, bytes.length);
    }

    private void ensureImageType(String imageType) {
        String imageTypeUpper = imageType.toUpperCase();
        if (!Stream.of(PROPER_IMG_TYPES).anyMatch(p -> p.equals(imageTypeUpper))) {
            throw new IllegalArgumentException("imageType");
        }
    }

    private void ensureSizeMultiplier(int sizeMultiplier) {
        if (sizeMultiplier < 1 || sizeMultiplier > 200) {
            throw new IllegalArgumentException("sizeMultiplier");
        }
    }
}
