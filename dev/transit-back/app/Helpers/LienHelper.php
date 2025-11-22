<?php

namespace App\Helpers;

use App\Models\Lien;

class LienHelper
{
    public static function GetLinkByIdDoc(int $idDocument)
    {
        return Lien::where('Id_Document', $idDocument)->first();
    }

    public static function InsertLink(array $data)
    {
        $link = Lien::create($data);
        return $link ? "success" : "error";
    }

    public static function UpdateLink(int $id, array $data)
    {
        $updated = Lien::where('ID', $id)->update($data);
        return $updated ? "success" : "error";
    }

    public static function DeleteLinkById(int $id)
    {
        $deleted = Lien::destroy($id);
        return $deleted ? "success" : "error";
    }
}
