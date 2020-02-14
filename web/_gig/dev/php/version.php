<?php

final class Version
{
    private static $_version = 1.01;
    public static function current()
    {
        return self::$_version;
    }
}
