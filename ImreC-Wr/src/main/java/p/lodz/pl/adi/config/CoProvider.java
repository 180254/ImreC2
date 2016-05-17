package p.lodz.pl.adi.config;

import com.amazonaws.AmazonClientException;
import com.amazonaws.auth.AWSCredentialsProvider;
import com.amazonaws.auth.InstanceProfileCredentialsProvider;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class CoProvider {

    public final static String CONFIG_FILENAME = "config.json";
    public final static String CONF_FILENAME = "conf.json";

    public static Config0 getConfig() throws IOException {

        try {
            AWSCredentialsProvider credProvider = new InstanceProfileCredentialsProvider();
            credProvider.getCredentials();
            return new Config2(credProvider);

        } catch (AmazonClientException ignored) {
            System.out.println("Unable to get credentials from ec2 metadata. config.json will be used.");
            return read(Config1.class, CONFIG_FILENAME);
        }
    }

    public static Conf getConf() throws IOException {
        return read(Conf.class, CONF_FILENAME);
    }

    private static <T> T read(Class<T> clazz, String filename) throws IOException {
        Path path = Paths.get(filename);
        byte[] bytes = Files.readAllBytes(path);
        String content = new String(bytes, StandardCharsets.UTF_8);

        return new ObjectMapper()
                .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
                .readerFor(clazz).readValue(content);
    }
}
