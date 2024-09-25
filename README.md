# FoundryVTT - Simpler Quests
This module aims to provide a streamlined and easy quest tracking system. The main goal is simplicity and on-the-fly usage.
**[Compatibility]**: FoundryVTT v12
**[Game Systems]**: *any*

# Installation
## Recommended Installation method
1. Install through Foundry's package management. The easiest way to do that is using the manifest url: `https://github.com/MythicPalette/simpler-quests/releases/latest/download/module.json`
2. Activate the module in your World in the `Module Management` settings.
3. Refresh your browser.

## Manual Installation method
1. Download the latest zip file from [here](https://github.com/MythicPalette/simpler-quests/releases/latest/download/module.zip)
2. Extract it to your modules folder in your Foundry user data directory.
3. Active the module in your World in the `Module Management` settings.
4. Refresh your browser.

# Usage
## Docked VS Undocked
There are two primary ways to use the module; Docked mode and Floating mode. Each user can decide which mode they want to use through the settings. There are very few differences between the two modes. The mode mostly controls how the tracker is placed on your screen. The default is docked.

While in Docked mode, the tracker will attach itself to the side of the sidebar.

![image](https://github.com/user-attachments/assets/9151afd1-1644-45f8-b3da-c58c0216875e)

While docked you can minimize the tracker but not close it.

![image](https://github.com/user-attachments/assets/c75e214b-2be3-4398-9d83-1db12ca802b1)

While undocked the tracker appears as a floating window. This window can be closed. To open it again you can go navigate to the note controls on the left and click the scroll icon

![image](https://github.com/user-attachments/assets/11718d28-fb72-4c74-8325-0435350917d5)

![image](https://github.com/user-attachments/assets/d49d7670-2b0b-4198-9cb2-f58430e36f4f)

## Creating/Editing a Quest
Start by clicking the `Add Quest` button on the titlebar or by clicking the `Edit Quest` button in the quest tracker (Only visible when moused over)

![image](https://github.com/user-attachments/assets/fa27cb10-e4f0-41b5-a76f-9ebb0079d24b)
![image](https://github.com/user-attachments/assets/05468101-294b-444e-9e81-a7f002755744)

![image](https://github.com/user-attachments/assets/66d9c2f1-0911-46e5-a2d1-6b76d1ad47c4)



This will present you with a quest configuration screen.

![image](https://github.com/user-attachments/assets/f6bd0af3-f9c4-4771-897b-81b58715f552)

You can easily set the quest name, quest visibility, objective view mode, and objectives.
### Quest Visibility Mode
Quest visibility controls how objectives are presented to players. The three modes make it easy to quickly display information how you like.
`All Quest Objectives` shows all of the objectives (excluding secrets) to the players at all times. Great if you want to let them see all the major points of a quest.

![image](https://github.com/user-attachments/assets/321b8df7-a1cd-4d06-873b-12c88b5b27d4)

`Up To Next Objective Only` shows only objectives that have been completed or failed and the next one. This will make sure your players don't get to peak ahead into the quest too far.

![image](https://github.com/user-attachments/assets/1e2260e7-c7e4-45e4-adc0-465ca838a65d)

`Only Completed` will only let players see objectives they've already finished. Great for keeping tabs on progress without letting the players peak ahead.

![image](https://github.com/user-attachments/assets/e5cc9c2e-eea6-4d15-8ec8-f44dba2e5c34)

Combine these modes with the use of secret objectives to present information in a creative way.

### Objectives
Objectives are written in a text area. Each `line` is a new objective. So write an objective, hit enter, and keep writing. No hoops.

You can easily set secrets and completed/failed quests with with a very fast syntax. Just put the following symbols at the beginning of a line to mark it. Don't worry, you don't have to use this if you don't want to! Just check out the [Objective Controls](https://github.com/MythicPalette/simpler-quests/edit/main/README.md#objective-controls) section to see how you can do all of this with just the click of a mouse.
* `/` Makes the objective a secret. Secrets can only be seen by the GM
* `+` Marks the quest as complete
* `-` marks the quest as failed

## Tracker Controls
Now for the main feature of this module, the tracker. The tracker was designed with one thing in mind "streamline". Every action should be quick and easy to do, especially for the GM. Nothing slows down a VTT campaign faster than having to jump through menus.

### Quest Controls
Click the quest title 

![image](https://github.com/user-attachments/assets/e1474b15-aa98-4829-a811-b01dfb379fad)

Clicking the quest name will collapse/expand the quest. By default, you can only have one quest expanded at a time, but there is a setting that each user can change to expand multiple quests if they prefer. You can set the quest visibility, edit the quest in the editor (Just like creating a quest), or delete the quest right here at the right hand side. The controls show up as soon as your mouse goes over the quest title.

### Objective Controls

![image](https://github.com/user-attachments/assets/1d72943a-26fb-4173-a20c-571d21dbe486)

![image](https://github.com/user-attachments/assets/5d73e80b-2f8d-4b11-a4c4-50aefcac4cb6)

Here is where the `streamline` mindset comes in handy. You can mark a quest objective complete by clicking it. If you click it a second time, it will mark as failed. Clicking a third time will reset it to incomplete. That easy.

Now, you may have noticed some objectives were written in purple. Those quests are `secrets`. Only the GM can see them. And, as you can see, they can be marked completed or failed without unhiding them as well. If you want to show an objective or make one a secret, there is no need to go into any of the menus. Just right-click the objective and it will toggle the secret state. This makes it great for revealing secret objectives on the fly without interrupting the flow of gameplay.

![image](https://github.com/user-attachments/assets/028e88f0-567b-480f-b11a-eb889ad4aa88)
![image](https://github.com/user-attachments/assets/77e56401-c269-4506-b239-d513512337a8)
