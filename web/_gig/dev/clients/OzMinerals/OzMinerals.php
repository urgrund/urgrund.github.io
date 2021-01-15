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
            $_server = "tcp:LAPTOP\SQLEXPRESS, 1433",
            $_uid = "test",
            $_pwd = "gigworth",
            $_db = "Pitram2"
        );
    }

    public function TimeZone(): DateTimeZone
    {
        return new DateTimeZone('Australia/Perth');
    }
}
