import {system, world} from '@minecraft/server';
import {ActionFormData} from "@minecraft/server-ui";
import {TOME_CHAPTERS, PAGES_CHAPTERS} from "tome/tomeChapters.js"
import {getPagesChapters, addChaptersToPlayerTomeData} from "tome/pages.js"

export class Tome {

	constructor(){}

	static createTomeDataV2(player){

		const tomeChapterData = {
			unlocked_chapters:{},
			page_last_opened: "main",
		};

		for (const [key, value] of Object.entries(PAGES_CHAPTERS["starter"])) {
			tomeChapterData.unlocked_chapters[key] = value;
		}
		
		player.setDynamicProperty('magical_brewery:tome_data_v2', JSON.stringify(tomeChapterData))
	}

	static getTomePlayerLastPage(player){
		let tomePlayerData = JSON.parse(player.getDynamicProperty('magical_brewery:tome_data_v2'));
		return tomePlayerData.page_last_opened;
	}

	static checkPlayerTomeData(player){
		const tomeDataV1 = player.getDynamicProperty('magical_brewery:tome_data');

		if(!tomeDataV1){
			console.log(`${player.name} does not have tome data V1, skipping...`);
			return;
		}

		const tomeDataV2 = player.getDynamicProperty('magical_brewery:tome_data_v2');

		if(tomeDataV2){
			console.log(`${player.name} already has tome data V2, skipping...`);
			return;
		}
		else{
			convertToTomeDataV2(player, tomeDataV1)
		}
	}

	static createTomeFormData(tomePage, player, tomePlayerData){

		let form = new ActionFormData();
		const formTitle = !TOME_CHAPTERS[tomePage].title ? `magical_brewery:tome_chapter_${tomePage}.title` : TOME_CHAPTERS[tomePage].title;
		
		form.title({translate: formTitle});
		form.body({translate: `magical_brewery:tome_chapter_${tomePage}.body`});

		let buttonLayout = Tome.getTomePageButtonLayout(tomePlayerData.unlocked_chapters[tomePage]);
		
		Tome.getformButtomProperties(form, buttonLayout)

		if(TOME_CHAPTERS[tomePage].exitPage) form.button("Go back", "");

		Tome.displayTomePageFormData(form, player, tomePlayerData.unlocked_chapters[tomePage], tomePlayerData, tomePage)

		player.dimension.playSound("item.book.page_turn", player.location, {volume: 0.7, pitch: 1})
	}	

	static getTomePageButtonLayout(unlockedChapters){

		let buttonPageLayout = [];
		if(!unlockedChapters){
			return buttonPageLayout;
		}else{
			unlockedChapters.forEach(el => buttonPageLayout.push(el))
			return buttonPageLayout;
		}
	}

	static getformButtomProperties(form, buttons){
		buttons.forEach(el => {
			let buttonTitle = `magical_brewery:tome_chapter_${el}.title`;

			if(TOME_CHAPTERS[el].title) buttonTitle = TOME_CHAPTERS[el].title;

			form.button(buttonTitle, TOME_CHAPTERS[el].icon)
		})
	}

	static displayTomePageFormData(form, player, tomePageChapters = [], tomePlayerData, tomePage){

		form.show(player)
		.then((response) => {
			
			if (response.canceled){ 
				
				tomePlayerData.page_last_opened = tomePage;
				player.setDynamicProperty('magical_brewery:tome_data_v2', JSON.stringify(tomePlayerData))
				player.dimension.playSound("item.book.put", player.location, {volume: 0.7, pitch: 0.7})
				
				return;
			}
			if(response.selection === (tomePageChapters.length)){
				Tome.createTomeFormData(TOME_CHAPTERS[tomePage].exitPage, player, tomePlayerData)
			}
			else{
				Tome.createTomeFormData(tomePageChapters[response.selection], player, tomePlayerData);
			}
		})
		.catch((e) => {
			console.error(e, e.stack);
		});
	}

	static convertToTomeDataV2(player, tomeDataV1){

		//Setup tomeDataV2 structure and add Main Chapters
		console.log(`Setting up tome data v2 structure for ${player.name}`);
		createTomeDataV2(player);
		createTomeResearchData(player);

		console.log(`Iterating through v1 tome data ${player.name}`);
		
		const playerTomeDataV1 = JSON.parse(tomeDataV1)
		let playerTomeDataV2 = JSON.parse(player.getDynamicProperty('magical_brewery:tome_data_v2'));
		
		playerTomeDataV1.unlocked_chapters.forEach(chapter =>{

			let pagesChapterObject;

			switch(chapter){
				case "Crystallography":
					pagesChapterObject = getPagesChapters("crystallography");
				break;
				case "Seals":
					pagesChapterObject = getPagesChapters("seals");
				break;
				case "Brewing":
					pagesChapterObject = getPagesChapters("brewing");
				break;
			}

			if(pagesChapterObject){
				console.log(`Found tome chapter: ${chapter}. Adding to ${player.name}'s tome data v2...`)
				console.log(JSON.stringify(pagesChapterObject))
				playerTomeDataV2 = addChaptersToPlayerTomeData(playerTomeDataV2, pagesChapterObject);
			}
		});
		player.setDynamicProperty('magical_brewery:tome_data_v2', JSON.stringify(playerTomeDataV2))
	}		
}


