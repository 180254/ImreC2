#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import datetime
import json
import sys

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
        "sdb",
        aws_access_key_id=config["accessKeyId"],
        aws_secret_access_key=config["secretAccessKey"],
        region_name=config["region"]
    )


def print_collecting(action, result):
    print("Collecting %s ... %d" % (action, len(result)))


def select_all_dates(action):
    select = "select cDate from " + conf["Sdb"]["Domain"] + \
             " where cDate like '%' and eAction = '" + action + \
             "' order by cDate desc limit 1000"

    result = []
    token = ""

    while token is not None:
        print_collecting(action, result)
        response = sdb.select(SelectExpression=select, NextToken=token)

        for item in response["Items"]:
            value = item["Attributes"][0]["Value"]
            value_date = datetime.datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
            result.append(value_date)

        token = response["NextToken"] if "NextToken" in response else None

    print_collecting(action, result)
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


def print_stats(dates):
    total = len(dates)
    print("Total: %d" % total)

    hours = (dates[0] - dates[-1]).total_seconds() / 3600
    avg = total / hours
    print("Average per hour: %.3f " % avg)

    busy_hour = calculate_busy_hour(dates)
    print("BusyHour per hour: %d (%s)" % (busy_hour[0], str(busy_hour[1])))


def calc_print_stats(action):
    dates = select_all_dates(action)
    print("\n---" + action + "---")
    print_stats(dates)
    print("")


def main():
    if len(sys.argv) > 1:
        init()

        for argv in sys.argv[1:]:
            calc_print_stats(argv)


if __name__ == "__main__":
    main()
