<?php
final class Version
{
    private static $_version = 1.01;
    final public static function current()
    {
        return self::$_version;
    }
}
