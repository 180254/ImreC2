package p.lodz.pl.adi;

import com.amazonaws.services.sqs.model.Message;
import p.lodz.pl.adi.config.CoProvider;
import p.lodz.pl.adi.config.Conf;
import p.lodz.pl.adi.config.Config;
import p.lodz.pl.adi.utils.AmazonHelper;
import p.lodz.pl.adi.utils.ExecutorHelper;
import p.lodz.pl.adi.utils.ImageResizer;
import p.lodz.pl.adi.utils.Logger;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.InetAddress;
import java.net.URL;
import java.util.List;
import java.util.concurrent.TimeUnit;

public class App {

    public static final String SLEEP_ENV_NAME = "WRSLEEP";
    public static final int DEFAULT_SLEEP_SECONDS = 5;

    private final Logger logger;

    private final ImageResizer im;
    private final AmazonHelper am;

    private final ExecutorHelper executor;

    private final int sleepSeconds;
    private final String selfIp;

    public App() throws IOException {
        Conf conf = CoProvider.getConf();
        Config config = CoProvider.getConfig();
        selfIp = getSelfIp();

        am = new AmazonHelper(config, conf);
        logger = new Logger(am, selfIp);
        im = new ImageResizer();

        am.setLogger(logger); // circular dependency!?

        executor = new ExecutorHelper();
        sleepSeconds = getSleepSeconds();
    }

    private int getSleepSeconds() {
        String sleep = System.getenv(SLEEP_ENV_NAME);
        if (sleep == null) {
            return DEFAULT_SLEEP_SECONDS;
        }

        try {
            int sleep2 = Integer.parseInt(sleep);
            if (sleep2 > 0) return sleep2;
            else {
                logger.log2("SLEEP_NOTE", "Env set but <= 0.");
                return DEFAULT_SLEEP_SECONDS;
            }
        } catch (NumberFormatException ignored) {
            logger.log2("SLEEP_SECONDS", "Env set but exception.");
            return DEFAULT_SLEEP_SECONDS;
        }
    }

    public String getSelfIp() throws IOException {
        URL whatIsMyIp = new URL("http://checkip.amazonaws.com");

        try (InputStream in = whatIsMyIp.openStream();
             InputStreamReader in2 = new InputStreamReader(in);
             BufferedReader in3 = new BufferedReader(in2)) {
            return in3.readLine().trim();

        } catch (IOException ignored) {
            logger.log2("SELF_IP", "Cannot obtain external ip.");
            return InetAddress.getLocalHost().toString();
        }
    }

    public void service() throws InterruptedException {
        logger.log2("SLEEP_SECONDS", sleepSeconds);
        logger.log2("SELF_IP", selfIp);

        //noinspection InfiniteLoopStatement
        do {

            int needTasks = executor.needTasks();
            List<Message> messages = am.sqs$receiveMessages(needTasks);

            for (Message message : messages) {
                Runnable resizeTask = new ResizeTask(
                        message, logger, am, im, selfIp,
                        () -> logger.log2("SERVICE",
                                executor.getCompletedTaskCount() + 1,
                                executor.getActiveCount() - 1)
                );
//                resizeTask.run();
                executor.submit(resizeTask);
            }

            TimeUnit.SECONDS.sleep(sleepSeconds);
        } while (true);
    }

    public static void main(String[] args)
            throws IOException, InterruptedException {
        new App().service();
    }

}
