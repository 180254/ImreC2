import datetime
import json

import boto3

CONFIG_FILE = "config.json"
CONF_FILE = "conf.json"

config = None
conf = None
sdb = None


def init():
    global config, conf, sdb

    with open(CONFIG_FILE) as data_file:
        config = json.load(data_file)
    with open(CONF_FILE) as data_file:
        conf = json.load(data_file)

    sdb = boto3.client(
        'sdb',
        aws_access_key_id=config["accessKeyId"],
        aws_secret_access_key=config["secretAccessKey"],
        region_name=config["region"]
    )


def select_all_dates():
    select = "select cDate from " + conf["Sdb"]["Domain"] + \
             " where cDate like '%' and eAction = 'CC_COMM_SCHEDULED'" \
             " order by cDate desc"

    result = []
    token = ''
    while True:
        response = sdb.select(SelectExpression=select, NextToken=token)

        for item in response["Items"]:
            value = item["Attributes"][0]["Value"]
            value_date = datetime.datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
            result.append(value_date)

        if "NextToken" in response:
            # break
            token = response["NextToken"]
            print("Collecting ... %d" % len(result))
        else:
            break

    return result


def sum_between_hours(dates, start, stop):
    dates_filtered = [date for date in dates if start <= date <= stop]
    return len(dates_filtered)


def calculate_busy_hour(dates):
    busy_hour_start = 0
    busy_hour_sum = 0
    current_start = dates[-1]

    while current_start < dates[0]:
        current_stop = current_start + datetime.timedelta(0, 3600)
        current_sum = sum_between_hours(dates, current_start, current_stop)

        if busy_hour_sum < current_sum:
            busy_hour_sum = current_sum
            busy_hour_start = current_start

        current_start = current_start + datetime.timedelta(0, 15)

    return busy_hour_sum, busy_hour_start


def main():
    init()
    dates = select_all_dates()

    total = len(dates)
    print("Total commissions: %d" % total)

    hours = (dates[0] - dates[-1]).total_seconds() / 3600
    avg = total / hours
    print("Average comm/hour: %.3f " % avg)

    busy_hour = calculate_busy_hour(dates)
    print("BusyHour comm/hour: %d (%s)" % (busy_hour[0], str(busy_hour[1])))


if __name__ == "__main__":
    main()
