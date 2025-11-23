<?php

namespace App\Helpers;

use App\Models\ParametreUser;

class Parametre_UserHelper
{
    public static function InsertParamUser(array $data)
    {
        $param = ParametreUser::create($data);
        return $param ? $param : "error";
    }

    public static function GetParameterById(int $id)
    {
        return ParametreUser::find($id);
    }

    public static function GetUserByParameterId(int $userId) // Nommé selon ton UML (mais logique "ByUserId")
    {
        return ParametreUser::where('Id_User', $userId)->first();
    }

    public static function UpdateParameterByUserId(int $userId, array $data)
    {
        $updated = ParametreUser::where('Id_User', $userId)->update($data);
        return $updated ? "success" : "error";
    }
}