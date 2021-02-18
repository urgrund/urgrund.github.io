<?php

class MineStar extends Client
{
    public function Name(): string
    {
        return "MineStar";
    }

    public function Path(): string
    {
        return "MineStar";
    }

    public function SQLDBCredentials(): SQLDBCredentials
    {
        return new SQLDBCredentials(
            $_server = "tcp:LAPTOP\SQLDEV,1433",
            $_uid = "test",
            $_pwd = "gw",
            $_db = "tempdb"
        );
    }

    public function TimeZone(): DateTimeZone
    {
        return new DateTimeZone('Australia/Perth');
    }

    public function ShiftStart(): float
    {
        return 6.5;
    }
}
