package p.lodz.pl.adi;

import com.amazonaws.services.sqs.model.Message;
import p.lodz.pl.adi.config.CoProvider;
import p.lodz.pl.adi.config.Conf;
import p.lodz.pl.adi.config.Config0;
import p.lodz.pl.adi.env.EnvHelper;
import p.lodz.pl.adi.env.EnvValue;
import p.lodz.pl.adi.utils.*;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.InetAddress;
import java.net.URL;
import java.util.List;
import java.util.concurrent.TimeUnit;

public class App {
    private final Logger logger;

    private final ImageResizer im;
    private final AmazonHelper am;
    private final ExecutorHelper executor;

    private final int sleepSeconds;
    private final int sleepOnFullSeconds;

    private final String selfIp;

    public App() throws IOException {
        Conf conf = CoProvider.getConf();
        Config0 config = CoProvider.getConfig();
        selfIp = getSelfIp();

        am = new AmazonHelper(config, conf);
        logger = new Logger(am, selfIp);
        im = new ImageResizer();

        am.setLogger(logger); // circular dependency!?

        executor = new ExecutorHelper();

        EnvHelper envHelper = new EnvHelper(logger);
        sleepSeconds = envHelper.getIntFromEnv(EnvValue.SleepSeconds);
        sleepOnFullSeconds = envHelper.getIntFromEnv(EnvValue.SleepOnFullSeconds);
    }

    public String getSelfIp() throws IOException {
        URL whatIsMyIp = new URL("http://checkip.amazonaws.com");

        try (InputStream in = whatIsMyIp.openStream();
             InputStreamReader in2 = new InputStreamReader(in);
             BufferedReader in3 = new BufferedReader(in2)) {
            return in3.readLine().trim();

        } catch (IOException ignored) {
            logger.log2("INT_SELF_IP", "Cannot obtain external ip.");
            return InetAddress.getLocalHost().toString();
        }
    }

    public void service() throws InterruptedException {
        //noinspection InfiniteLoopStatement
        do {

            int needTasks = executor.needTasks();
            if (needTasks <= 0) {
                TimeUnit.SECONDS.sleep(sleepOnFullSeconds);
                continue;
            }

            List<Message> messages = am.sqs$receiveMessages(needTasks);

            for (Message message : messages) {
                Runnable resizeTask = new ResizeTask(
                        message, logger, am, im, selfIp,
                        () -> logger.log2("INT_SERVICE",
                                executor.getCompletedTaskCount() + 1,
                                executor.getNotCompletedCount() - 1)
                );

//                resizeTask.run();
                executor.submit(resizeTask);

                logger.log2("INT_SERVICE",
                        executor.getCompletedTaskCount(),
                        executor.getNotCompletedCount());
            }

            TimeUnit.SECONDS.sleep(sleepSeconds);
        } while (true);
    }

    public static void main(String[] args)
            throws IOException, InterruptedException {
        new App().service();
    }

}
