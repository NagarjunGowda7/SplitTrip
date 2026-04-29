import { ScrollView, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { MemberAvatar } from "@/components/MemberAvatar";
import { useExpenses } from "@/hooks/useExpenses";
import { useTrips } from "@/hooks/useTrips";

export const TripMembersScreen = ({ navigation }: any) => {
  const { activeTrip } = useTrips();
  const { expenses } = useExpenses(activeTrip?.id);

  return (
    <ScrollView className="flex-1 bg-sand" contentContainerStyle={{ padding: 24, gap: 16 }}>
      <Text className="font-display text-3xl text-ink">Trip Members</Text>
      {activeTrip ? (
        <Button
          title="Edit Trip and Members"
          variant="secondary"
          onPress={() => navigation.navigate("CreateTrip", { tripId: activeTrip.id })}
        />
      ) : null}
      {activeTrip?.members.map((member) => {
        const paid = expenses
          .filter((expense) => expense.payerId === member.id)
          .reduce((sum, expense) => sum + expense.amount, 0);
        const owes = expenses.reduce(
          (sum, expense) =>
            sum + (expense.shares.find((share) => share.memberId === member.id)?.amount ?? 0),
          0,
        );
        const balance = paid - owes;

        return (
          <Card key={member.id}>
            <View className="flex-row items-center gap-3">
              <MemberAvatar name={member.name} />
              <View className="flex-1">
                <Text className="text-base font-semibold text-ink">{member.name}</Text>
                <Text className="text-sm text-slate">{member.email ?? "Invite pending"}</Text>
                <Text className="mt-2 text-sm text-slate">
                  Paid {paid.toFixed(2)} | Owes {owes.toFixed(2)} | Balance {balance.toFixed(2)}
                </Text>
              </View>
            </View>
          </Card>
        );
      })}
    </ScrollView>
  );
};
