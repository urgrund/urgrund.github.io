<?php
final class Version
{
    private static $_version = 2.0;
    final public static function current()
    {
        return self::$_version;
    }
}


// History

// 2.0
// A more modular and scalable approach,  data uses config files to filter out sites 
// generation code is more concise and cleaner as sql/php/front-end start to settle 

// 1.01
// Initial setup of the data,  not much understood yet of the stucture and how the different
// tech components will all work together
