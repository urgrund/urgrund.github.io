<?php

class Newcrest extends Client
{
    public function Name(): string
    {
        return "Newcrest";
    }

    public function Path(): string
    {
        return "Newcrest";
    }

    public function SQLDBCredentials(): SQLDBCredentials
    {
        return new SQLDBCredentials(
            $_server = "tcp:LAPTOP\SQLEXPRESS, 1433",
            $_uid = "test",
            $_pwd = "gigworth",
            $_db = "test"
        );
    }

    public function TimeZone(): DateTimeZone
    {
        return new DateTimeZone('Australia/Perth');
    }
}
