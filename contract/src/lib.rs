use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::UnorderedMap;
use near_sdk::json_types::U128;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::serde_json::json;
use near_sdk::{base64, env, ext_contract, near_bindgen, AccountId, Gas, PanicOnDefault, Promise};
use std::collections::HashMap;

#[ext_contract(ext_croncat)]
pub trait CronContract {
    fn create_task(
        &mut self,
        contract_id: AccountId,
        function_id: String,
        cadence: String,
        recurring: Option<bool>,
        deposit: Option<U128>,
        gas: Option<u64>,
        arguments: Option<String>,
    ) -> Base64VecU8;
}
#[ext_contract(ext)]
pub trait CronContract {
    fn schedule_callback(
        &mut self,
        #[callback]
        #[serializer(borsh)]
        task_hash: Base64VecU8,
    );
}

#[derive(PartialEq, Serialize, Deserialize, BorshDeserialize, BorshSerialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub enum ProjectStatus {
    Funding,
    Funded,
    Cancelled,
    Unfulfilled,
}

#[derive(
    Clone,
    Copy,
    Hash,
    Eq,
    PartialEq,
    PartialOrd,
    Serialize,
    Deserialize,
    BorshDeserialize,
    BorshSerialize,
    Debug,
)]
#[serde(crate = "near_sdk::serde")]
pub enum SupporterType {
    Basic,
    Intermediate,
    Advanced,
}

#[derive(PartialEq, Serialize, Deserialize, BorshDeserialize, BorshSerialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub enum SupporterPlans {
    OneTime,
    Recurring,
}

#[derive(Serialize, Deserialize, BorshDeserialize, BorshSerialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct Supporter {
    pub level: SupporterType,
    pub used_verification: bool,
}

#[derive(Serialize, Deserialize, BorshDeserialize, BorshSerialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct Project {
    pub id: u64,
    pub owner: AccountId,
    pub name: String,
    pub description: String,
    pub supporters: HashMap<AccountId, Supporter>,
    pub balance: u128,
    pub goal: u128,
    pub end_time: u64,
    pub status: ProjectStatus,
    pub plan: SupporterPlans,
    pub level_amounts: HashMap<SupporterType, u128>,
    pub images: Vec<String>,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Nearkick {
    current_id: u64,
    projects: UnorderedMap<u64, Project>,
}

#[near_bindgen]
impl Nearkick {
    #[init]
    pub fn new() -> Self {
        Self {
            current_id: 0,
            projects: UnorderedMap::new(b"p".to_vec()),
        }
    }

    pub fn add_project(
        &mut self,
        goal: u128,
        name: String,
        description: String,
        plan: SupporterPlans,
        end_time: u64,
        cadence: String,
        basic_supporter_amount: u128,
        intermediate_supporter_amount: u128,
        advanced_supporter_amount: u128,
        images: Vec<String>,
    ) -> u64 {
        self.current_id += 1;
        let project = Project {
            id: self.current_id,
            owner: env::signer_account_id(),
            name,
            description,
            supporters: HashMap::new(),
            balance: 0,
            goal,
            end_time: env::block_timestamp() + end_time,
            status: ProjectStatus::Funding,
            plan,
            level_amounts: HashMap::from([
                (SupporterType::Basic, basic_supporter_amount),
                (SupporterType::Intermediate, intermediate_supporter_amount),
                (SupporterType::Advanced, advanced_supporter_amount),
            ]),
            images,
        };

        self.validate_project(&project);

        self.projects.insert(&project.id, &project);

        ext_croncat::create_task(
            env::current_account_id(),
            "check_if_project_funded_or_unfulfilled".to_string(),
            cadence,
            Some(false),
            Some(U128::from(0)),
            Some(30_000_000_000_000), // 30 Tgas
            Some(base64::encode(
                json!({
                    "project_id": self.current_id,
                })
                .to_string(),
            )),
            AccountId::new_unchecked("manager_v1.croncat.testnet".to_string()),
            3_500_000_000_000_000_000_000,
            Gas::from(25_000_000_000_000),
        );

        project.id
    }

    pub fn update_project(
        &mut self,
        project_id: u64,
        goal: u128,
        name: String,
        description: String,
        plan: SupporterPlans,
        basic_supporter_amount: u128,
        intermediate_supporter_amount: u128,
        advanced_supporter_amount: u128,
        images: Vec<String>,
    ) {
        let project = self.projects.get(&project_id).unwrap();

        if project.owner != env::signer_account_id() {
            env::panic_str("Only the owner can update the project");
        }

        let new_project = Project {
            id: project_id,
            owner: env::signer_account_id(),
            name,
            description,
            supporters: project.supporters,
            balance: project.balance,
            goal,
            end_time: project.end_time,
            status: project.status,
            plan,
            level_amounts: HashMap::from([
                (SupporterType::Basic, basic_supporter_amount),
                (SupporterType::Intermediate, intermediate_supporter_amount),
                (SupporterType::Advanced, advanced_supporter_amount),
            ]),
            images,
        };

        self.validate_project(&new_project);

        self.projects.insert(&project_id, &new_project);
    }

    fn validate_project(&self, project: &Project) {
        let mut error_messages = Vec::new();

        if project.name.len() < 3 {
            error_messages.push("Project name must be at least 3 characters");
        }

        if project.name.len() > 100 {
            error_messages.push("Project name must be 100 characters or less");
        }

        if project.description.len() < 100 {
            error_messages.push("Project description must be at least 100 characters");
        }

        if project.description.len() > 500 {
            error_messages.push("Project description must be 500 characters or less");
        }

        if project.goal < 1 {
            error_messages.push("Project goal must be at least 1");
        }

        if project.plan != SupporterPlans::OneTime && project.plan != SupporterPlans::Recurring {
            error_messages.push("Project plan must be either OneTime or Recurring");
        }

        if project.end_time < 1 {
            error_messages.push("Project end date must be in the future");
        }

        if project.level_amounts[&SupporterType::Basic] < 1 {
            error_messages.push("Basic supporter amount must be at least 1");
        }

        if project.level_amounts[&SupporterType::Intermediate] < 1 {
            error_messages.push("Intermediate supporter amount must be at least 1");
        }

        if project.level_amounts[&SupporterType::Advanced] < 1 {
            error_messages.push("Advanced supporter amount must be at least 1");
        }

        if project.images.len() < 1 {
            error_messages.push("Project must have at least 1 image");
        }

        if project.images.len() > 5 {
            error_messages.push("Project images must be 5 or less");
        }

        if error_messages.len() > 0 {
            env::panic_str(error_messages.join(", ").as_str());
        }
    }

    #[payable]
    pub fn add_supporter_to_project(&mut self, project_id: u64, level: SupporterType) {
        let supporter_amount_needed = self.get_supporter_level_amount(&project_id, &level);
        let attached_deposit = env::attached_deposit();

        if attached_deposit < supporter_amount_needed {
            env::panic_str(
                format!(
                    "Not enough attached deposit: Needed: {}, Attached: {}",
                    supporter_amount_needed, attached_deposit
                )
                .as_str(),
            );
        }

        let mut project = self.projects.get(&project_id).unwrap();

        if project.status != ProjectStatus::Funding {
            env::panic_str("Project needs to be of status (Funding), cannot add supporter");
        }

        let supporter = Supporter {
            level,
            used_verification: false,
        };
        project
            .supporters
            .insert(env::signer_account_id(), supporter);
        project.balance += attached_deposit;
        if project.balance >= project.goal {
            project.status = ProjectStatus::Funded;
        }
        self.projects.insert(&project_id, &project);

        Promise::new(project.owner).transfer(attached_deposit);
    }

    pub fn verify_supporter_on_project(
        &mut self,
        project_id: u64,
        supporter_id: AccountId,
    ) -> bool {
        let mut project = self.projects.get(&project_id).unwrap();

        if project.status == ProjectStatus::Cancelled
            || project.status == ProjectStatus::Unfulfilled
        {
            env::panic_str("Project is cancelled or unfulfilled, cannot verify supporter");
        }

        if project.status != ProjectStatus::Funded {
            env::panic_str("Project is not funded, cannot verify supporter");
        }

        let supporter = project.supporters.get(&supporter_id).unwrap().clone();

        if !project.supporters.contains_key(&supporter_id) {
            env::panic_str(format!("{} is not a supporter of this project", supporter_id).as_str());
        }

        if project.plan == SupporterPlans::OneTime && supporter.used_verification {
            env::panic_str("Supporter already used verification code");
        }

        let new_supporter = Supporter {
            level: supporter.level,
            used_verification: true,
        };
        project.supporters.insert(supporter_id, new_supporter);
        self.projects.insert(&project_id, &project);
        true
    }

    pub fn get_all_projects(&self) -> Vec<Project> {
        let mut projects = Vec::new();
        for project in self.projects.iter() {
            projects.push(project.1);
        }
        projects
    }

    pub fn get_all_projects_by_owner(&self, owner: AccountId) -> Vec<Project> {
        let mut projects = Vec::new();
        for project in self.projects.iter() {
            if project.1.owner == owner {
                projects.push(project.1);
            }
        }
        projects
    }

    pub fn get_project(&self, project_id: u64) -> Project {
        self.projects.get(&project_id).unwrap()
    }

    pub fn cancel_project(&mut self, project_id: u64) {
        let mut project = self.projects.get(&project_id).unwrap();

        if project.owner != env::signer_account_id() {
            env::panic_str("Only the owner can cancel the project");
        }

        if project.status != ProjectStatus::Funding {
            env::panic_str("Project must be in Funding status to be cancelled");
        }

        project.status = ProjectStatus::Cancelled;
        self.projects.insert(&project_id, &project);
        self.refund_supporters(project_id);
    }

    pub fn check_if_project_funded_or_unfulfilled(&mut self, project_id: u64) {
        let mut project = self.projects.get(&project_id).unwrap();

        if project.end_time > env::block_timestamp() {
            env::panic_str("Project end time is in the future");
        }

        if project.status != ProjectStatus::Funding {
            env::panic_str(
                "Project must be in Funding status to be checked if funded or unfulfilled",
            );
        }

        if project.goal > project.balance {
            project.status = ProjectStatus::Unfulfilled;
            self.refund_supporters(project_id);
            self.projects.insert(&project_id, &project);
        }
    }

    fn get_supporter_level_amount(&self, project_id: &u64, level: &SupporterType) -> u128 {
        let project = self.projects.get(project_id).unwrap();
        project.level_amounts[&level]
    }

    fn refund_supporters(&mut self, project_id: u64) {
        let mut project = self.projects.get(&project_id).unwrap();
        for supporter in project.supporters.iter() {
            let amount = self.get_supporter_level_amount(&project_id, &supporter.1.level);
            Promise::new(supporter.0.clone()).transfer(amount);
        }
        project.balance = 0;
        self.projects.insert(&project_id, &project);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::VMContextBuilder;
    use near_sdk::{testing_env, VMContext};

    fn get_context(signer_account_id: AccountId, is_view: bool) -> VMContext {
        VMContextBuilder::new()
            .signer_account_id(signer_account_id)
            .is_view(is_view)
            .build()
    }

    fn alice() -> AccountId {
        "alice".parse().unwrap()
    }

    fn get_project_mock_data() -> Project {
        Project {
            id: 1,
            owner: env::signer_account_id(),
            name: "Project name".to_string(),
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent molestie augue eu sem mollis, tincidunt.".to_string(),
            supporters: HashMap::new(),
            balance: 0,
            goal: 10000,
            end_time: env::block_timestamp() + 100,
            status: ProjectStatus::Funding,
            plan: SupporterPlans::OneTime,
            level_amounts: HashMap::from([
                (SupporterType::Basic, 100),
                (SupporterType::Intermediate, 1000),
                (SupporterType::Advanced, 5000),
            ]),
            images: vec!["QmdG5NGpe9Vd4Zp5rs1hbkvsgC5makB1KUSRvV6vaqVyt4".to_string()],
        }
    }

    fn create_project(contract: &mut Nearkick) -> u64 {
        let mock_data = get_project_mock_data();

        let project_id = contract.add_project(
            mock_data.goal,
            mock_data.name,
            mock_data.description,
            mock_data.plan,
            mock_data.end_time,
            "0 30 23 * * *".to_string(),
            mock_data.level_amounts[&SupporterType::Basic],
            mock_data.level_amounts[&SupporterType::Intermediate],
            mock_data.level_amounts[&SupporterType::Advanced],
            mock_data.images,
        );

        project_id
    }

    #[test]
    fn test_add_project() {
        let context = get_context(alice(), false);
        testing_env!(context);

        let mut nearkick = Nearkick::new();

        let project_id = create_project(&mut nearkick);
        assert_eq!(nearkick.projects.get(&project_id).unwrap().id, project_id);
    }

    #[test]
    fn test_update_project() {
        let context = get_context(alice(), false);
        testing_env!(context);

        let mut nearkick = Nearkick::new();

        let new_project_goal_amount = 20000;

        let project_id = create_project(&mut nearkick);
        nearkick.update_project(
            project_id,
            new_project_goal_amount, // updated property
            "Project name".to_string(),
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent molestie augue eu sem mollis, tincidunt.".to_string(),
            SupporterPlans::OneTime,
            100,
            1000,
            5000,
            vec!["QmdG5NGpe9Vd4Zp5rs1hbkvsgC5makB1KUSRvV6vaqVyt4".to_string()],
        );
        assert_eq!(
            nearkick.projects.get(&project_id).unwrap().goal,
            new_project_goal_amount
        );
    }

    #[test]
    fn test_add_supporter_to_project() {
        let mut context = get_context(alice(), false);
        context.attached_deposit = 100;
        testing_env!(context);

        let mut nearkick = Nearkick::new();

        let project_id = create_project(&mut nearkick);
        nearkick.add_supporter_to_project(project_id, SupporterType::Basic);
        assert_eq!(nearkick.projects.get(&project_id).unwrap().balance, 100);
    }

    #[test]
    fn test_verify_supporter_on_project() {
        let mut context = get_context(alice(), false);
        context.attached_deposit = 10000; // depositing 10000 to fund whole goal
        testing_env!(context);

        let mut nearkick = Nearkick::new();

        let project_id = create_project(&mut nearkick);
        nearkick.add_supporter_to_project(project_id, SupporterType::Basic);
        assert_eq!(
            nearkick.verify_supporter_on_project(project_id, alice()),
            true
        );
    }

    #[test]
    fn test_cancel_project() {
        let context = get_context(alice(), false);
        testing_env!(context);

        let mut nearkick = Nearkick::new();

        let project_id = create_project(&mut nearkick);
        nearkick.cancel_project(project_id);
        assert_eq!(
            nearkick.projects.get(&project_id).unwrap().status,
            ProjectStatus::Cancelled
        );
    }

    #[test]
    fn test_check_if_project_funded_or_unfulfilled() {
        let context = get_context(alice(), false);
        testing_env!(context);

        let mut nearkick = Nearkick::new();

        let project_id = create_project(&mut nearkick);

        // set end_time to current timestamp to bypass asserts in check
        let mut project = nearkick.get_project(project_id);
        project.end_time = env::block_timestamp();
        nearkick.projects.insert(&project_id, &project);

        assert_eq!(project.status, ProjectStatus::Funding);
        nearkick.check_if_project_funded_or_unfulfilled(project_id);
        let project = nearkick.get_project(project_id);
        assert_eq!(project.status, ProjectStatus::Unfulfilled);
    }

    #[test]
    fn test_get_supporter_level_amount() {
        let context = get_context(alice(), false);
        testing_env!(context);

        let created_project_basic_amount = 100;

        let mut nearkick = Nearkick::new();

        let project_id = create_project(&mut nearkick);
        let amount = nearkick.get_supporter_level_amount(&project_id, &SupporterType::Basic);
        assert_eq!(amount, created_project_basic_amount);
    }

    #[test]
    fn test_refund_supporters() {
        let mut context = get_context(alice(), false);
        context.attached_deposit = 100;
        testing_env!(context);

        let mut nearkick = Nearkick::new();

        let project_id = create_project(&mut nearkick);
        nearkick.add_supporter_to_project(project_id, SupporterType::Basic);
        let project = nearkick.get_project(project_id);
        assert_eq!(project.balance, 100);
        nearkick.refund_supporters(project_id);
        let project = nearkick.get_project(project_id);
        assert_eq!(project.balance, 0);
    }

    #[test]
    fn test_get_all_projects() {
        let context = get_context(alice(), false);
        testing_env!(context);

        let mut nearkick = Nearkick::new();

        create_project(&mut nearkick);
        let projects = nearkick.get_all_projects();
        assert_eq!(projects.len(), 1);
    }

    #[test]
    fn test_get_all_projects_by_owner() {
        let context = get_context(alice(), false);
        testing_env!(context);

        let mut nearkick = Nearkick::new();

        create_project(&mut nearkick);
        let projects = nearkick.get_all_projects_by_owner(alice());
        assert_eq!(projects.len(), 1);
    }

    #[test]
    fn test_get_project() {
        let context = get_context(alice(), false);
        testing_env!(context);

        let mut nearkick = Nearkick::new();

        let project_id = create_project(&mut nearkick);
        let project = nearkick.get_project(project_id);
        assert_eq!(project.id, project_id);
    }
}
