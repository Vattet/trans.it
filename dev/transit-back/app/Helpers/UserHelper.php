<?php

namespace App\Helpers;

use App\Models\User;

class UserHelper
{
    public static function GetAllUser()
    {
        return User::all();
    }
    public static function GetUserByEmail($email)
    {
        return User::where('Email', $email)->first();
    }

    public static function InsertUser(array $data)
    {
        $user = User::create($data);

        return $user ? "success" : "error";
    }

    public static function GetUserById(int $id)
    {
        return User::find($id);
    }

    public static function UpdateUserById(int $id, array $data)
    {
        $updated = User::where("ID", $id)->update($data);

        return $updated ? "success" : "error";
    }

    public static function DeleteUserById(int $id)
    {
        $deleted = User::destroy($id);

        return $deleted ? "success" : "error";
    }
}
