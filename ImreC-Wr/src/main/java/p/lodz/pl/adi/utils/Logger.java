package p.lodz.pl.adi.utils;

import com.amazonaws.AmazonClientException;
import com.google.common.base.Splitter;
import com.google.common.collect.Lists;
import org.apache.commons.lang3.tuple.Pair;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class Logger {

    public static final int SDB_LENGTH_LIMIT = 1024;
    private final DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final AmazonHelper am;
    private String selfIp;

    public Logger(AmazonHelper am, String selfIp) {
        this.am = am;
        this.selfIp = selfIp;
    }

    public void log(String action, Object... args) {
        try {
            logInternal(true, action, args);

        } catch (AmazonClientException ignored) {
            System.out.println("? - Unable to send log.");
        }
    }

    public void log2(String action, Object... args) {
        logInternal(false, action, args);
    }

    private void logInternal(boolean sdbPut, String action, Object... args) {
        String text = String.format("1 | %s | ? | %s", LocalDateTime.now().format(dtf), action);

        for (Object mes : args) {
            String mesAsString = mes != null ? mes.toString() : "NULL";
            text += String.format(" | %s", mesAsString);
        }

        System.out.println(text);

        if (sdbPut) {
            Collection<Pair<String, String>> attrs = new ArrayList<>();
            attrs.add(Pair.of("aApp", "Wr"));
            attrs.add(Pair.of("bAppInstance", selfIp));

            attrs.add(Pair.of("cDate", LocalDateTime.now(ZoneOffset.UTC).format(dtf)));
            attrs.add(Pair.of("dReqIP", "?"));
            attrs.add(Pair.of("eAction", action));

            for (int i = 0; i < args.length; i++) {
                Object mes = args[i];
                String mesAsString = mes != null ? mes.toString() : "NULL";

                if (mesAsString.length() <= SDB_LENGTH_LIMIT) {
                    attrs.add(Pair.of("fArg_" + i, mesAsString));

                } else {
                    Iterable<String> chunks = Splitter.fixedLength(SDB_LENGTH_LIMIT).split(mesAsString);
                    List<String> chunksList = Lists.newArrayList(chunks);

                    for (int c = 0; c < chunksList.size(); c++) {
                        attrs.add(Pair.of("fArg_" + i + "_" + c, mesAsString));
                    }
                }
            }

            am.sdb$putLogAsync(attrs);
        }
    }
}
