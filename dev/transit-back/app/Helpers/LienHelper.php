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
    public static function GetAllLink()
    {
        return Lien::all();
    }

    public static function GetAllLinkByUserId($id)
    {
        return Lien::whereHas('document', function ($q) use ($id) {
            $q->where('Id_User', $id);
        })->get();
    }
    public static function GetLinkByUniqueCode($code)
    {
        return Lien::where('Code_unique', $code)
            ->with('document.user')
            ->first();
    }

    public static function FindActiveDownloadLink($code)
    {
        $lien = Lien::with('document')
            ->where('Code_unique', $code)
            ->first();

        if (!$lien) {
            return null;
        }

        if (!$lien->IsActive) {
            return null;
        }

        if ($lien->Date_Expiration && now()->gt($lien->Date_Expiration)) {
            return null;
        }

        return $lien;
    }
}
