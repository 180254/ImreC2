package p.lodz.pl.adi.utils;

import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.ThreadPoolExecutor;

public class ExecutorHelper {

    public static final int MESSAGE_LIMIT = 10;
    public static final int PROCESSOR_MULTIPLIER = 4;
    public static final double NEED_MULTIPLIER = 1;

    private final int processors = Runtime.getRuntime().availableProcessors();
    private final int executorSlots = processors * PROCESSOR_MULTIPLIER;
    private final ThreadPoolExecutor executor = (ThreadPoolExecutor) Executors.newFixedThreadPool(executorSlots);

    public int getActiveCount() {
        return executor.getActiveCount();
    }

    public long getCompletedTaskCount() {
        return executor.getCompletedTaskCount();
    }

    public int needTasks() {
        int need = (int) (executorSlots * NEED_MULTIPLIER - executor.getActiveCount());
        return Math.min(MESSAGE_LIMIT, need);
    }

    public Future<?> submit(Runnable task) {
        return executor.submit(task);
    }
}
