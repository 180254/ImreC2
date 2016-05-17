package p.lodz.pl.adi.env;

import p.lodz.pl.adi.utils.Logger;

public class EnvHelper {

    private final Logger logger;

    public EnvHelper(Logger logger) {
        this.logger = logger;
    }

    public int getIntFromEnv(EnvValue ev) {
        String envValue = System.getenv(ev.getEnvName());

        if (envValue == null) {
            logger.log2("INT_ENV", ev.getEnvName(), ev.getDefaultValue(), "Env not set. Using default.");
            return ev.getDefaultValue();
        }

        try {
            int envValue2 = Integer.parseInt(envValue);

            if (envValue2 > 0) {
                logger.log2("INT_ENV", ev.getEnvName(), envValue2, "Env set.");
                return envValue2;

            } else {
                logger.log2("INT_ENV", ev.getEnvName(), ev.getDefaultValue(), "Env set but <= 0.");
                return ev.getDefaultValue();
            }

        } catch (NumberFormatException ignored) {
            logger.log2("INT_ENV", ev.getEnvName(), ev.getDefaultValue(), "Env set but exception.");
            return ev.getDefaultValue();
        }
    }
}
