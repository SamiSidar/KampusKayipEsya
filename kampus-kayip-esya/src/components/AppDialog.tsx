import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

/**
 * AppDialog — Uygulama içi diyalog (uyarı / onay / seçim penceresi).
 *
 * Neden gerekli:
 * react-native-web'in Alert modülü boş bir stub'tır (`static alert() {}`),
 * yani web'de RN'in Alert.alert() çağrısı hiçbir şey yapmaz. Bu yüzden
 * ekranlarda `Platform.OS === 'web'` kontrolü yapılıp window.alert() /
 * window.confirm() kullanılıyordu. Bunlar tarayıcının kendi diyaloglarıdır:
 * sayfanın üstünde şerit olarak çıkar, "localhost:3000 diyor ki" yazar,
 * hiçbir şekilde stillendirilemez ve JS thread'ini bloklar.
 *
 * Bu bileşen RN Modal üzerine kuruludur — react-native-web Modal'ı tam olarak
 * destekler (portal + focus trap + Escape ile kapanma). Böylece web ve mobilde
 * birebir aynı, uygulamanın kendi temasıyla stillendirilmiş bir pencere çıkar.
 *
 * Kullanım:
 *   const { alert, confirm, choose } = useDialog();
 *
 *   await alert({ title: 'Başarılı', message: 'Kayıt oluşturuldu.', tone: 'success' });
 *
 *   const onaylandi = await confirm({
 *     title: 'Çıkış Yap',
 *     message: 'Emin misiniz?',
 *     tone: 'danger',
 *     confirmText: 'Çıkış Yap',
 *   });
 *
 *   const kaynak = await choose({
 *     title: 'Fotoğraf Ekle',
 *     actions: [
 *       { label: 'Kamera', value: 'camera' },
 *       { label: 'Galeri', value: 'library' },
 *       { label: 'İptal', value: 'cancel', style: 'cancel' },
 *     ],
 *   });
 */

export type DialogTone = 'info' | 'success' | 'warning' | 'danger';

type DialogOptions = {
  title: string;
  message?: string;
  tone?: DialogTone;
  confirmText?: string;
  cancelText?: string;
};

export type DialogAction = {
  label: string;
  value: string;
  style?: 'default' | 'cancel' | 'danger';
};

type ChooseOptions = {
  title: string;
  message?: string;
  tone?: DialogTone;
  actions: DialogAction[];
};

type DialogRequest = {
  mode: 'alert' | 'confirm' | 'choose';
  title: string;
  message?: string;
  tone?: DialogTone;
  confirmText?: string;
  cancelText?: string;
  actions?: DialogAction[];
};

type DialogContextValue = {
  /** Tek butonlu bilgilendirme. Kullanıcı kapatınca çözülür. */
  alert: (options: DialogOptions) => Promise<void>;
  /** İki butonlu onay. Onaylanırsa true, iptal/kapatma durumunda false döner. */
  confirm: (options: DialogOptions) => Promise<boolean>;
  /** Çok seçenekli liste. Seçilen action'ın value'su, kapatılırsa null döner. */
  choose: (options: ChooseOptions) => Promise<string | null>;
};

const DialogContext = createContext<DialogContextValue | null>(null);

const toneStyles: Record<
  DialogTone,
  { icon: keyof typeof Ionicons.glyphMap; color: string; tint: string }
> = {
  info: {
    icon: 'information-circle-outline',
    color: colors.yeditepeBlue,
    tint: colors.blueTint12,
  },
  success: {
    icon: 'checkmark-circle-outline',
    color: colors.success,
    tint: colors.successTint12,
  },
  warning: {
    icon: 'alert-circle-outline',
    color: colors.warning,
    tint: colors.warningTint14,
  },
  danger: {
    icon: 'warning-outline',
    color: colors.error,
    tint: colors.errorTint10,
  },
};

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [request, setRequest] = useState<DialogRequest | null>(null);

  // Açık diyaloğun sözünü (promise) çözen fonksiyon. Ref'te tutuluyor ki
  // state güncellemeleri arasında bayat closure'a takılmasın.
  const resolverRef = useRef<((value: any) => void) | null>(null);

  const close = useCallback((result: any) => {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    setRequest(null);
    if (resolve) resolve(result);
  }, []);

  const open = useCallback((next: DialogRequest, dismissValue: any) => {
    return new Promise<any>(resolve => {
      // Üst üste açılma durumunda öncekini "kapatıldı" say
      if (resolverRef.current) resolverRef.current(dismissValue);
      resolverRef.current = resolve;
      setRequest(next);
    });
  }, []);

  const value = useMemo<DialogContextValue>(
    () => ({
      alert: async options => {
        await open({ ...options, mode: 'alert' }, undefined);
      },
      confirm: options => open({ ...options, mode: 'confirm' }, false),
      choose: options => open({ ...options, mode: 'choose' }, null),
    }),
    [open]
  );

  const tone = toneStyles[request?.tone ?? 'info'];
  const mode = request?.mode;
  const dismissValue = mode === 'confirm' ? false : mode === 'choose' ? null : undefined;

  function renderActions() {
    if (mode === 'choose') {
      return (request?.actions ?? []).map(action => {
        const isCancel = action.style === 'cancel';
        const background = action.style === 'danger' ? colors.error : tone.color;

        return (
          <Pressable
            key={action.value}
            style={[
              styles.button,
              isCancel ? styles.cancelButton : { backgroundColor: background },
            ]}
            onPress={() => close(action.value)}
            accessibilityRole="button"
            accessibilityLabel={action.label}
          >
            <Text
              style={isCancel ? styles.cancelButtonText : styles.confirmButtonText}
            >
              {action.label}
            </Text>
          </Pressable>
        );
      });
    }

    return (
      <>
        {mode === 'confirm' ? (
          <Pressable
            style={[styles.button, styles.buttonRow, styles.cancelButton]}
            onPress={() => close(false)}
            accessibilityRole="button"
            accessibilityLabel={request?.cancelText || 'İptal'}
          >
            <Text style={styles.cancelButtonText}>
              {request?.cancelText || 'İptal'}
            </Text>
          </Pressable>
        ) : null}

        <Pressable
          style={[
            styles.button,
            mode === 'confirm' ? styles.buttonRow : null,
            { backgroundColor: tone.color },
          ]}
          onPress={() => close(true)}
          accessibilityRole="button"
          accessibilityLabel={request?.confirmText || 'Tamam'}
        >
          <Text style={styles.confirmButtonText}>
            {request?.confirmText || 'Tamam'}
          </Text>
        </Pressable>
      </>
    );
  }

  return (
    <DialogContext.Provider value={value}>
      {children}

      <Modal
        visible={request !== null}
        transparent
        animationType="fade"
        onRequestClose={() => close(dismissValue)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => close(dismissValue)}
          accessibilityLabel="Pencereyi kapat"
        >
          {/* İçeriğe yapılan tıklama overlay'e sızıp pencereyi kapatmasın */}
          <Pressable
            style={styles.card}
            onPress={() => {}}
            accessibilityViewIsModal
          >
            <View style={[styles.iconCircle, { backgroundColor: tone.tint }]}>
              <Ionicons name={tone.icon} size={30} color={tone.color} />
            </View>

            <Text style={styles.title} accessibilityRole="header">
              {request?.title}
            </Text>

            {request?.message ? (
              <Text style={styles.message}>{request.message}</Text>
            ) : null}

            <View
              style={[
                styles.actions,
                mode === 'confirm' && styles.actionsRow,
              ]}
            >
              {renderActions()}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog, DialogProvider içinde kullanılmalıdır.');
  }
  return context;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.card,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 18,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },

  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  title: {
    fontSize: 17.5,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },

  message: {
    marginTop: 8,
    fontSize: 13.5,
    fontWeight: '600',
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  actions: {
    width: '100%',
    marginTop: 20,
    gap: 9,
  },

  actionsRow: {
    flexDirection: 'row',
  },

  button: {
    minHeight: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  // Yan yana dizilen (confirm) butonlar eşit genişlikte olsun
  buttonRow: {
    flex: 1,
  },

  cancelButton: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLight50,
  },

  cancelButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textSecondary,
  },

  confirmButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.white,
  },
});
