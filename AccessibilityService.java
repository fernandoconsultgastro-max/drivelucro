package com.drivelucro.app;

import android.accessibilityservice.AccessibilityService;
import android.view.accessibility.AccessibilityEvent;

public class DriveAccessibilityService extends AccessibilityService {

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {

        if (event == null || event.getText() == null) return;

        String texto = event.getText().toString();

        // 🔥 DEBUG: ver o que aparece na tela
        System.out.println("TELA: " + texto);

        // 👇 Aqui vamos detectar padrões
        if (texto.contains("R$") && texto.contains("km")) {

            // Aqui você vai extrair valor e km
            analisarCorrida(texto);
        }
    }

    @Override
    public void onInterrupt() {
    }

    private void analisarCorrida(String texto) {
        System.out.println("Corrida detectada: " + texto);

        // Aqui depois entra sua lógica (igual do web)
    }
}