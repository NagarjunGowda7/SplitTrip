import { useState } from "react";
import { Text } from "react-native";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ConfirmationPanel } from "@/components/ConfirmationPanel";
import { FormMessage } from "@/components/FormMessage";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAuth } from "@/hooks/useAuth";
import { useExpenses } from "@/hooks/useExpenses";
import { useTrips } from "@/hooks/useTrips";

export const SettingsScreen = () => {
  const { logout, user } = useAuth();
  const { activeTrip, deleteTrip } = useTrips();
  const { syncing, syncOffline, offlineQueueCount } = useExpenses(activeTrip?.id);
  const [confirmTripDelete, setConfirmTripDelete] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const [working, setWorking] = useState(false);

  const handleTripDelete = async () => {
    if (!activeTrip) return;
    setWorking(true);
    setError(undefined);
    try {
      await deleteTrip(activeTrip.id);
      setConfirmTripDelete(false);
      setMessage("Trip deleted.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to delete trip.");
    } finally {
      setWorking(false);
    }
  };

  const handleSignOut = async () => {
    setWorking(true);
    setError(undefined);
    try {
      await logout();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to sign out.");
    } finally {
      setWorking(false);
    }
  };

  return (
    <ScreenContainer contentContainerStyle={{ padding: 24, gap: 16 }}>
      <Text className="font-display text-3xl text-ink">Profile & Settings</Text>
      <FormMessage message={error} />
      <FormMessage message={message} tone="success" />
      <Card>
        <Text className="text-lg font-semibold text-ink">Account</Text>
        <Text className="mt-2 text-sm text-slate">{user?.displayName}</Text>
        <Text className="mt-1 text-sm text-slate">{user?.email}</Text>
        <Text className="mt-3 text-xs uppercase tracking-widest text-slate">Version 1.0.0</Text>
      </Card>
      <Card>
        <Text className="text-lg font-semibold text-ink">Trip Context</Text>
        <Text className="mt-2 text-sm text-slate">
          Active trip: {activeTrip?.name ?? "None selected"}
        </Text>
        <Text className="mt-1 text-sm text-slate">
          Offline queued expenses: {offlineQueueCount}
        </Text>
      </Card>
      <Card>
        <Text className="text-lg font-semibold text-ink">Offline Sync</Text>
        <Text className="mt-2 text-sm text-slate">
          Save expenses without internet and push them to Firestore automatically once the connection returns.
        </Text>
      </Card>
      <Button title={syncing ? "Syncing..." : "Sync Offline Expenses"} onPress={() => syncOffline()} disabled={syncing} />
      {activeTrip ? (
        confirmTripDelete ? (
          <ConfirmationPanel
            title="Delete Current Trip?"
            description="This removes the trip document and its visible summary from the app. Use this only if you really want to remove the current trip."
            confirmLabel="Delete Trip"
            onConfirm={handleTripDelete}
            onCancel={() => setConfirmTripDelete(false)}
            loading={working}
          />
        ) : (
          <Button title="Delete Current Trip" variant="danger" onPress={() => setConfirmTripDelete(true)} />
        )
      ) : null}
      {confirmSignOut ? (
        <ConfirmationPanel
          title="Sign Out?"
          description="You will return to the authentication screens and need to sign in again to continue."
          confirmLabel="Sign Out"
          onConfirm={handleSignOut}
          onCancel={() => setConfirmSignOut(false)}
          loading={working}
        />
      ) : (
        <Button title="Sign Out" variant="danger" onPress={() => setConfirmSignOut(true)} />
      )}
    </ScreenContainer>
  );
};
