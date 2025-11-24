<?php

namespace App\Helpers;

use App\Models\ParametreUser;
use Carbon\Carbon;

class Parametre_UserHelper
{
    /** CREATE */
    public static function InsertParamUser($param)
    {
        try {
            return ParametreUser::create([
                'Id_User' => $param['Id_User'],
                'Notification_Mail' => $param['Notification_Mail'],
                'Langue' => $param['Langue'],
                'Date_Update' => Carbon::now(),
                'Date_Creation' => Carbon::now(),
            ]);
        } catch (\Exception $e) {
            return null;
        }
    }

    /** READ by parameter ID */
    public static function GetParameterById(int $id)
    {
        return ParametreUser::find($id);
    }

    /** READ by user ID */
    public static function GetParameterByUserId(int $userId)
    {
        return ParametreUser::where('Id_User', $userId)->first();
    }

    /** UPDATE */
    public static function UpdateParameterByUserId(int $userId, array $data)
    {
        try {
            $param = ParametreUser::where('Id_User', $userId)->first();

            if (!$param)
                return "not_found";

            $param->update([
                'Notification_Mail' => $data['Notification_Mail'] ?? $param->Notification_Mail,
                'Langue' => $data['Langue'] ?? $param->Langue,
                'Date_Update' => Carbon::now(),
            ]);

            return "success";
        } catch (\Exception $e) {
            return "error";
        }
    }

    /** DELETE by parameter ID */
    public static function DeleteParameterById(int $id)
    {
        $param = ParametreUser::find($id);

        if (!$param)
            return "not_found";

        $param->delete();
        return "success";
    }

    /** DELETE by user ID */
    public static function DeleteParameterByUserId(int $userId)
    {
        $param = ParametreUser::where('Id_User', $userId)->first();

        if (!$param)
            return "not_found";

        $param->delete();
        return "success";
    }
}
