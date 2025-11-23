<?php

namespace App\Helpers;

use App\Models\Historique;

class HistoriqueHelper
{
    public static function InsertHistory(array $data)
    {
        $status = Historique::create($data);
        return $status ? "success" : "error";
    }

    public static function GetHistoryById(int $id)
    {
        return Historique::find($id);
    }

    public static function GetHistoryByLinkId(int $linkId)
    {
        // Retourne une collection (plusieurs historiques pour un lien)
        return Historique::where('Id_Lien', $linkId)->get();
    }
}