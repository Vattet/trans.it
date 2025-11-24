<?php

namespace App\Helpers;

use App\Models\Historique;
use Carbon\Carbon;

class HistoriqueHelper
{
    /** INSERT */
    public static function InsertHistory($history)
    {
        try {
            Historique::create([
                'Id_Lien' => $history['Id_Lien'],
                'Action' => $history['Action'],
                'Adresse_IP' => $history['Adresse_IP'],
                'Date_Update' => Carbon::now(),
                'Date_Creation' => Carbon::now(),
            ]);

            return "success";
        } catch (\Exception $e) {
            return "error";
        }
    }

    /** GET history by ID */
    public static function GetHistoryById(int $id)
    {
        return Historique::find($id);
    }

    /** GET all history related to a Link */
    public static function GetHistoryByLinkId(int $linkId)
    {
        return Historique::where('Id_Lien', $linkId)->get();
    }
}
