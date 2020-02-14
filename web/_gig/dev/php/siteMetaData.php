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

    public function FillFromData($_data)
    {
        $isObject = is_object($_data);
        if ($isObject) {
            $this->Day = $_data->Day;
            $this->Date = $_data->Date;
            $this->LastUpdate = $_data->LastUpdate;
            $this->IP = $_data->IP;
            $this->User = $_data->User;
            $this->Version = $_data->Version;
        } else {
            $this->Day = $_data["Day"];
            $this->Date = $_data["Date"];
            $this->LastUpdate = $_data["LastUpdate"];
            $this->IP = $_data["IP"];
            $this->User = $_data["User"];
            $this->Version = $_data["Version"];
        }
    }
}
