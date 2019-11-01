<?php

// Maybe overkill to have this as a class but it makes it
// more deliberately used and the variable is private
final class Version
{
    private static $_version = 1.00;
    public static function current()
    {
        return self::$_version;
    }
}
