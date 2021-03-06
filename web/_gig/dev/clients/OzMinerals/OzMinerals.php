<?php

class OzMinerals extends Client
{
    public function Name(): string
    {
        return "OzMinerals";
    }

    public function Path(): string
    {
        return "OzMinerals";
    }

    public function SQLDBCredentials(): SQLDBCredentials
    {
        return new SQLDBCredentials(
            $_server = "tcp:LAPTOP\SQLDEV, 1433",
            $_uid = "test",
            $_pwd = "gw",
            $_db = "Pitram2"
        );
    }

    public function TimeZone(): DateTimeZone
    {
        return new DateTimeZone('Australia/Perth');
    }

    public function ShiftStart(): float
    {
        return 7;
    }
}
