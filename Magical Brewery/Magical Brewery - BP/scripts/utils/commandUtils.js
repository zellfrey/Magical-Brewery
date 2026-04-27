import {CommandPermissionLevel, CustomCommandParamType, CustomCommandStatus, system, world, Player} from "@minecraft/server";

system.beforeEvents.startup.subscribe(({ customCommandRegistry }) => {
	customCommandRegistry.registerCommand(
		{
			name: "magical_brewery:resetplayertomedata",
			description: "Dev command to reset player tome data.",
			//description: "Dev command to reset player tome data. The affected player must be online",
			permissionLevel: CommandPermissionLevel.Admin,
			cheatsRequired: false,
			mandatoryParameters: [
				{ name: "player", type: CustomCommandParamType.PlayerSelector  },
				{ name: "confirmation", type: CustomCommandParamType.Boolean },
			],
		},
		(origin, player, confirmation) => {
			
			const targetPlayer = world.getAllPlayers()[0];
			//const targetPlayer = world.getAllPlayers().filter(el => el.id === player["0"].id)
			console.log(targetPlayer.level)
			//if(!(targetPlayer instanceof Player)) console.log("false")
			if(!confirmation){
				return {
                    status: CustomCommandStatus.Failure,
                    message: "Confirmation denied",
                };
			}
			
			system.run(() => targetPlayer.clearDynamicProperties());
			return {
                status: CustomCommandStatus.Success,
                message: "Successfully reset player tome data",
            };
		}
	);
});

// function commandResetPlayerTomeData(customCommandRegistry){

// }