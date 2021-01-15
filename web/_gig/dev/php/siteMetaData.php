<?php

final class SiteMetaData
{
    var $Day;

    var $Date;

    /** When was this data last updated **/
    var $LastUpdate;

    /** The IP address that requested this data be generated **/
    var $IP;

    /** The User that requested this data be generated **/
    var $User;

    /** Data version **/
    var $Version;

    /** Maps the equipment code to a descriptive version **/
    var $EquipmentFunctionMap;

    /** How long this site took to generate **/
    var $TimeToGenerate;
}
