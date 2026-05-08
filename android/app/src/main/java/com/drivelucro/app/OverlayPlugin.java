package com.drivelucro.app;

import android.content.Intent;
import android.net.Uri;
import android.provider.Settings;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "OverlayPlugin")
public class OverlayPlugin extends Plugin {

    private OverlayManager overlayManager;

    @Override
    public void load() {
        overlayManager = new OverlayManager(getActivity());
    }

    @PluginMethod
    public void mostrarOverlay(PluginCall call) {
        String decisao = call.getString("decisao", "ANALISAR");
        String mensagem = call.getString("mensagem", "Aguardando dados da corrida");
        String valorKm = call.getString("valorKm", "0.00");
        String valorHora = call.getString("valorHora", "0.00");

        String texto =
                "Decisão: " + decisao +
                        "\nR$/km: " + valorKm +
                        "\nR$/hora: " + valorHora +
                        "\n" + mensagem;

        if (!Settings.canDrawOverlays(getContext())) {
            Intent intent = new Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:" + getContext().getPackageName())
            );

            getActivity().startActivity(intent);

            call.reject("Permissão de sobreposição necessária.");
            return;
        }

        try {
            getActivity().runOnUiThread(() -> {
                overlayManager.mostrarOverlay(texto);
            });
            call.resolve();
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }

    @PluginMethod
    public void removerOverlay(PluginCall call) {
        try {
            overlayManager.removerOverlay();
            call.resolve();
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }
}