package com.drivelucro.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private OverlayManager overlayManager;

    @Override
    public void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);

        overlayManager = new OverlayManager(this);
    }

    public void mostrarOverlayTeste() {

        if (overlayManager != null) {
            overlayManager.mostrarOverlay("DriveLucro Overlay Ativo");
        }
    }

    public void removerOverlayTeste() {

        if (overlayManager != null) {
            overlayManager.removerOverlay();
        }
    }
}