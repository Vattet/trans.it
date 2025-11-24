<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Document;
use App\Models\Lien;
use OpenApi\Attributes as OA;

class AdminController extends Controller
{
    /**
     * @OA\Get(
     * path="/api/admin/stats",
     * summary="Récupérer les statistiques globales de la plateforme",
     * tags={"Admin"},
     * security={{"bearerAuth":{}}},
     *
     * @OA\Response(
     * response=200,
     * description="Statistiques récupérées avec succès",
     * @OA\JsonContent(
     * @OA\Property(property="totalUsers", type="integer", example=150),
     * @OA\Property(property="totalTransfers", type="integer", example=340),
     * @OA\Property(property="totalDownloads", type="integer", example=1205),
     * @OA\Property(property="totalStorage", type="number", format="float", example=500.25),
     * @OA\Property(property="activeTransfers", type="integer", example=45)
     * )
     * )
     * )
     */
    public function getStats()
    {
        $totalUsers = User::count();
        $totalTransfers = Document::count();
        $totalDownloads = Lien::sum('Nb_Acces');
        $totalStorage = round(Document::sum('Tailles_MB'), 2);
        $activeTransfers = Lien::where('IsActive', true)
            ->where(function ($query) {
                $query->whereNull('Date_Expiration')
                    ->orWhere('Date_Expiration', '>', now());
            })->count();

        $chartData = [];

        for ($i = 6; $i >= 0; $i--) {
            // On prend la date d'il y a $i jours
            $date = Carbon::today()->subDays($i);
            $dateString = $date->format('Y-m-d');

            // On compte les documents créés ce jour-là
            $docsCount = Document::whereDate('Date_Creation', $dateString)->count();

            // On compte les liens créés ce jour-là
            $linksCount = Lien::whereDate('Date_Creation', $dateString)->count();

            $chartData[] = [
                'date' => $date->format('M d'), // Format "Nov 23" pour le graph
                'transfers' => $docsCount,      // Barre Bleue
                'downloads' => $linksCount      // Barre Violette (Links created)
            ];
        }

        return response()->json([
            'totalUsers' => $totalUsers,
            'totalTransfers' => $totalTransfers,
            'totalDownloads' => (int) $totalDownloads,
            'totalStorage' => $totalStorage,
            'activeTransfers' => $activeTransfers,
            'chartData' => $chartData // <--- On envoie le tableau au front
        ]);
    }
}