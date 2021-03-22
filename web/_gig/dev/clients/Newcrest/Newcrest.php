<?php

class Newcrest extends Client
{
    public function Name(): string
    {
        return "Newcrest Telfer";
    }

    public function Path(): string
    {
        return "Newcrest";
    }

    public function SQLDBCredentials(): SQLDBCredentials
    {
        return new SQLDBCredentials(
            $_server = "tcp:LAPTOP\SQLDEV, 1433",
            $_uid = "test",
            $_pwd = "gw",
            $_db = "UG_Telfer"
            // $_server = "tcp:LAPTOP\SQLEXPRESS, 1433",
            // $_uid = "test",
            // $_pwd = "gigworth",
            // $_db = "test"
        );
    }

    public function TimeZone(): DateTimeZone
    {
        return new DateTimeZone('Australia/Perth');
    }

    public function ShiftStart(): float
    {
        return 6;
    }
}
